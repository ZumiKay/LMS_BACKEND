import { Login } from "../controller/Authentication/Account.controller";

jest.mock("../models/user.model");
jest.mock("../models/Usersession.model");
jest.mock("bcrypt");
jest.mock("../Utilities/Security");
jest.mock("../Utilities/ErrorCode");

describe("Login", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it("Invalid Parameter", async () => {
    req.body = { email: "", password: "" };
    await Login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
