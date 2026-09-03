import User, { IUser } from "../models/User";

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return User.findOne({ googleId });
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }

  async findAllPatients(): Promise<IUser[]> {
    return User.find({ role: "patient" }).sort({ name: 1 });
  }

  async findAllDoctors(status?: "pending" | "approved" | "rejected"): Promise<IUser[]> {
    const query: any = { role: "doctor" };
    if (status) {
      query.status = status;
    }
    return User.find(query).sort({ name: 1 });
  }

  async countUsersByRole(role: "patient" | "doctor" | "admin"): Promise<number> {
    return User.countDocuments({ role });
  }
}
