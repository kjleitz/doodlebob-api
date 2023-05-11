import path from "path";
import { createStream, RotatingFileStream } from "rotating-file-stream";
import { ROOT_PATH } from "../../constants";
import Config from "../../Config";

export default function createRotatingLogStream(logBaseFileName: string): RotatingFileStream {
  return createStream(logBaseFileName, {
    interval: "1d",
    size: "10M",
    path: path.join(ROOT_PATH, "log"),
    compress: "gzip",
    maxSize: "1G",
  });
}
