import { Router } from "express";
import ghanaPostService from "../services/ghanapost.service";

const testRouter = Router();

testRouter.get("/", async (req, res) => {
  try {
    const result = await ghanaPostService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
    console.log(error)
  }
});

export default testRouter;
