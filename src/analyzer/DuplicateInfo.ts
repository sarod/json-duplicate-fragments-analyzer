import { JsonFragment } from './JsonFragment';
export type DuplicateInfo = {
    fragmentsCount: number;
    stringifiedLength: number;
    percentOfTotalLength: number;
    preview: string;
    fragments: JsonFragment[];
};
