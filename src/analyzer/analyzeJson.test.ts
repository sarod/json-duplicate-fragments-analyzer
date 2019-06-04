import { analyzeJson } from "./analyzeJson";
import { DuplicateInfo } from "./DuplicateInfo";

it('throws for invalid json', () => {
    expect(() => analyzeJson('')).toThrow(Error);
});

it('analyze should find duplicates in props', () => {
    const duplicateValue = { whatever: 'This object is used several times' };
    const jsonWithDuplicate = JSON.stringify(
        {
            prop1: duplicateValue,
            prop2: duplicateValue
        });

    const result = analyzeJson(jsonWithDuplicate, { indexPredicate: (value, path) => { console.log(value); return true; }, maxFragmentsLimit: 100 });
    expect(result.fragmentsInfo.length).toBe(2);
    const duplicateInfo: DuplicateInfo = result.fragmentsInfo[0];
    expect(duplicateInfo).toMatchObject({
        fragmentsCount: 2,
        fragments: [
            { path: ['prop1'], value: duplicateValue },
            { path: ['prop2'], value: duplicateValue }
        ]
    });
});
