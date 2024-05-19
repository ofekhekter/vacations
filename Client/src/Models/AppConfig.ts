export type AppConfig = {
  baseUrl: string;
  get: {
    allVacations: string;
    oneVacation: string;
    oneImage: string;
  };
  post: {
    vacation: string;
    signup: string;
    signin: string;
    addOneImage: string;
    isAdmin: string;
    addFollow: string;
  };
  update: {
    vacation: string;
  };
  delete: {
    vacation: string;
    removeImage: string;
    removeFollow: string;
  };
};
