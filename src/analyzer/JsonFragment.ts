import { JsonValue } from "./JsonValue";
import { Path } from "./Path";
export interface JsonFragment {
    value: JsonValue;
    path: Path;
}
