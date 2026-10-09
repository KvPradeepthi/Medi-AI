import axios from "axios";
import fs from "fs";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ReportRepository } from "../repositories/ReportRepository";
import { IReport } from "../models/Report";
import { isConfigured as isCloudinaryConfigured, cloudinary } from "../config/cloudinary";

export class ReportService {
  private reportRepository = new ReportRepository();

  async uploadAndAnalyze(
    patientId: string,
    file: Express.Multer.File,
    reportType: "Blood Test" | "CBC" | "MRI" | "CT" | "ECG" | "X-Ray" | "Other"
  ): Promise<IReport> {
    let fileUrl = "";
    
    // 1. Upload to Cloudinary if available, otherwise use local mock URL
    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "mediai_reports",
          resource_type: "auto",
        });
        fileUrl = uploadResult.secure_url;
        logger.info(`Uploaded report file to Cloudinary: ${fileUrl}`);
      } catch (cloudinaryError: any) {
        logger.error(`Cloudinary upload failed: ${cloudinaryError.message}. Falling back to mock URL.`);
        fileUrl = `/uploads/${file.filename}`;
      }
    } else {
      fileUrl = `/uploads/${file.filename}`;
      logger.info(`Saved report locally: ${fileUrl}`);
    }

    // 2. Call FastAPI AI service to extract text, run OCR, and summarize
    let extractedText = "";
    let aiAnalysis = {
      summary: "Pending clinical analysis.",
      severity: "GREEN" as "GREEN" | "YELLOW" | "RED",
      abnormalValues: [] as any[],
      recommendations: ["Consult your healthcare provider to review this laboratory report."],
      foods: [] as string[],
      nextSteps: "Share this document with your doctor for clinical evaluation.",
    };

    try {
      logger.info(`Calling FastAPI AI service to analyze report: ${file.originalname}`);
      
      // We pass the local path or file buffer to FastAPI
      const fileStream = fs.createReadStream(file.path);
      const axiosForm = require("form-data");
      const form = new axiosForm();
      form.append("file", fileStream, file.originalname);
      form.append("report_type", reportType);

      const response = await axios.post(`${env.AI_SERVICE_URL}/api/v1/ai/analyze-report`, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.data) {
        extractedText = response.data.extracted_text || `Report: ${file.originalname}`;
        aiAnalysis = {
          summary: response.data.analysis.summary,
          severity: response.data.analysis.severity,
          abnormalValues: response.data.analysis.abnormal_values || [],
          recommendations: response.data.analysis.recommendations || [],
          foods: response.data.analysis.foods || [],
          nextSteps: response.data.analysis.next_steps,
        };
        logger.info(`Successfully parsed analysis results from FastAPI for ${file.originalname}`);
      }
    } catch (apiError: any) {
      logger.error(`FastAPI report analysis failed: ${apiError.message}. Storing report without AI analysis.`);
      extractedText = `Document: ${file.originalname} (Uploaded for manual medical review)`;
      aiAnalysis = {
        summary: "Automated AI analysis is currently unavailable for this report. The document has been securely stored for clinical review.",
        severity: "GREEN",
        abnormalValues: [],
        recommendations: ["Please share this document directly with your treating physician for medical evaluation."],
        foods: [],
        nextSteps: "Consult your doctor or specialist to interpret this laboratory result.",
      };
    }

    // 3. Save report to MongoDB Atlas
    const savedReport = await this.reportRepository.create({
      patientId: patientId as any,
      fileName: file.originalname,
      fileUrl,
      reportType,
      extractedText,
      aiAnalysis,
    });

    // 4. Trigger index creation in ChromaDB asynchronously for subsequent RAG chatbot queries
    try {
      logger.info(`Requesting RAG indexation for report: ${savedReport._id}`);
      await axios.post(`${env.AI_SERVICE_URL}/api/v1/ai/index-report`, {
        patient_id: patientId,
        report_id: savedReport._id.toString(),
        text: extractedText,
        report_type: reportType,
        date: savedReport.createdAt.toISOString().split("T")[0],
      });
      logger.info(`ChromaDB indexing completed for report ${savedReport._id}`);
    } catch (indexError: any) {
      logger.error(`FastAPI RAG indexation failed: ${indexError.message}`);
    }

    return savedReport;
  }

  async getPatientHistory(patientId: string): Promise<IReport[]> {
    return this.reportRepository.findByPatientId(patientId);
  }

  async getReportDetails(id: string): Promise<IReport | null> {
    return this.reportRepository.findById(id);
  }
}
