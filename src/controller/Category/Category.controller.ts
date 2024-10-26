import { Request, Response } from "express";
import Category from "../../models/category.model";
import ErrorCode from "../../Utilities/ErrorCode";

export async function GetCategories(req: Request, res: Response) {
  try {
    const categories = await Category.findAll({});

    return res.status(200).json({ data: categories });
  } catch (error) {
    console.log("Get Categories", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}
