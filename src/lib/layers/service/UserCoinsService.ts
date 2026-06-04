import { UserDataAccess } from "../data-access/UserDataAccess";

export class UserCoinsService {
  constructor(private readonly userDataAccess: UserDataAccess = new UserDataAccess()) {}

  async addUserCoin(userId: string, amount: number) {
    try {
      const result = await this.userDataAccess.addUserCoins(userId, amount);
      return result;
    } catch (error) {
      console.error('Error adding user coin:', error);
      return { success: false, error };
    }
  }
}