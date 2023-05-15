import { DataSource } from "typeorm";
import appDataSource from "../config/appDataSource";

export default function initDataSource(dataSource = appDataSource): Promise<DataSource> {
  return dataSource.isInitialized ? Promise.resolve(dataSource) : dataSource.initialize();
}
