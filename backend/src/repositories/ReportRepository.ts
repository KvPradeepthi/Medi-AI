import Report, { IReport } from "../models/Report";

export class ReportRepository {
  async findById(id: string): Promise<IReport | null> {
    return Report.findById(id).populate("patientId", "name email");
  }

  async findByPatientId(patientId: string): Promise<IReport[]> {
    return Report.find({ patientId }).sort({ createdAt: -1 });
  }

  async create(reportData: Partial<IReport>): Promise<IReport> {
    const report = new Report(reportData);
    return report.save();
  }

  async delete(id: string): Promise<IReport | null> {
    return Report.findByIdAndDelete(id);
  }

  async countReports(): Promise<number> {
    return Report.countDocuments();
  }

  async countByReportType(): Promise<any[]> {
    return Report.aggregate([
      { $group: { _id: "$reportType", count: { $sum: 1 } } }
    ]);
  }
}
