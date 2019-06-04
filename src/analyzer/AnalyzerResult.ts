import { DuplicateInfo } from "./DuplicateInfo";
export type AnalyzerResult = {
    originalJsonLength: number;
    compactJsonLength: number;
    fragmentsInfo: DuplicateInfo[];
};
