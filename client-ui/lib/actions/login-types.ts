export type LoginState = {
  type: "" | "success" | "error";
  message: string;
};

export const initialState: LoginState = {
  type: "",
  message: "",
};
