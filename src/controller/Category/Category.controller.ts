import { Request, Response } from "express";
import Category from "../../models/category.model";
import ErrorCode from "../../Utilities/ErrorCode";
import { CustomReqType } from "../../Types/AuthenticationType";

export async function GetCategories(req: Request, res: Response) {
  try {
    const categories = await Category.findAll({
      attributes: {
        exclude: ["description", "createdAt", "updatedAt"],
      },
    });

    return res.status(200).json({ data: categories });
  } catch (error) {
    console.log("Get Categories", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function CreateCategory(req: CustomReqType, res: Response) {
  try {
    const { data } = req.body as { data: Array<string> };
    await Category.bulkCreate(data.map((i) => ({ name: i })));
    return res.status(200).json({ message: "Create Successfully" });
  } catch (error) {
    console.log("Create Category", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}
