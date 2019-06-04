import './App.css';

import { FormControlLabel, Typography } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import React, { ChangeEvent } from 'react';

import { AnalyzerResultViewer } from './AnalyzerResultViewer/AnalyzerResultViewer';
import { analyzeJson } from './analyzer/analyzeJson';
import { AnalyzerResult } from './analyzer/AnalyzerResult';
import { useInterner } from './utils/interner';

import Divider from '@material-ui/core/Divider';

const duplicateValue = { whatever: 'This object is used several times' };
const exampleJson = JSON.stringify(
  {
    prop1: duplicateValue,
    prop2: duplicateValue,
    prop3: {
      prop4: duplicateValue,
      prop5: [
        duplicateValue,
        duplicateValue,
        'otherValue'
      ]
    },
  }, null, '  ');



const App: React.FC = () => {
  const [json, setJson] = React.useState(exampleJson);
  const handleJsonChange = React.useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setJson(event.target.value);
  }, [setJson]);

  const [includeString, setIncludeString] = React.useState(false);
  const handleIncludeStringChange = React.useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setIncludeString(event.target.checked);
  }, [setIncludeString]);


  const interner = useInterner();

  return (
    <div className="App"
      style={
        interner({
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          margin: '8px',
        })
      }>

      <Typography variant="h6">Config</Typography>
      <TextField
        id="json-text"
        label="Json"
        multiline
        rows="15"
        rowsMax="15"
        value={json}
        onChange={handleJsonChange}
        margin="normal"
        variant="outlined"
        placeholder="Paste JSON block here"
        style={
          interner({ width: '100%' })
        }
      />
      <FormControlLabel
        label="Include strings"
        control={
          <Checkbox
            id="include-string-checkbox"
            checked={includeString}
            onChange={handleIncludeStringChange}
          />}>
      </FormControlLabel>



      {json && <>
        <Divider variant="fullWidth" />
        <Typography variant="h6">Result</Typography>
        <AnalyzerComponent json={json} includeString={includeString} /></>}

    </div>
  );
}


type AnalyzerComponentProps = { json: string, includeString: boolean };
const AnalyzerComponent = ({ json, includeString }: AnalyzerComponentProps) => {
  const analyzerResult: AnalyzerResult | Error = React.useMemo(() => analyzeOrError(json, includeString), [json, includeString]);

  if (analyzerResult instanceof Error) {
    return <div>
      <Typography variant="body2">Error analyzing Json:</Typography>
      <pre>{analyzerResult.stack || analyzerResult.toString()}</pre>

    </div>;
  } else {
    return <AnalyzerResultViewer result={analyzerResult} />
  }
}

export default App;

function analyzeOrError(json: string, includeString: boolean): AnalyzerResult | Error {
  try {
    return analyzeJson(json, {
      indexPredicate: (value, path) => (typeof value !== 'number' && typeof value !== 'boolean' && (includeString || typeof value !== 'string')),
      maxFragmentsLimit: 20
    });
  } catch (e) {
    return e as Error;
  }
}

