import { AppConfig } from "../Models/AppConfig";

export const appConfig: AppConfig = {
  baseUrl: "http://localhost:3001/api",
  get: {
    allVacations: "/vacations",
    allFollowings: "/followings/",
    oneVacation: "/vacations/",
    oneImage: "/images/",
    getUserId: "/auth/",
  },
  post: {
    vacation: "/vacations",
    signup: "/auth/signup",
    signin: "/auth/signin",
    addOneImage: "/images",
    isAdmin: "/auth/isadmin",
    addFollow: "/followings/",
  },
  delete: {
    vacation: "/vacations/",
    removeImage: "/images/",
    removeFollow: "/followings/",
  },
  update: {
    vacation: "/vacations/",
  },
};
