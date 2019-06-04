import './App.css';

import TextField from '@material-ui/core/TextField';
import React, { ChangeEvent } from 'react';

import { object } from 'prop-types';
import { computeJsonDupsInfo, FragmentInfo, JsonDupsInfo, JsonFragment } from './computeDedupInfo';
import { makeStyles } from '@material-ui/styles';
import { useInterner } from './interner';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { Typography, FormControlLabel } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';


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


  const dedupInfo: JsonDupsInfo = React.useMemo(() => computeJsonDupsInfo(json, {
    indexPredicate: (value, path) => (typeof value !== 'number' && typeof value !== 'boolean' && (includeString || typeof value !== 'string')),
    maxFragmentsLimit: 20
  }), [json, includeString]);


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



      <Typography variant="h6">
        Original JSON is {dedupInfo.normalizedJsonTextLength} characters ({dedupInfo.originalJsonTextLength} before restringify).
        Found {dedupInfo.fragmentsInfo.length} duplicated fragments.
      </Typography>
      <div>
        {dedupInfo.fragmentsInfo.map((fragInfo, index) => (
          <ExpansionPanel key={index}>
            <ExpansionPanelSummary>
              <Typography>Fragment [{ellipsis(fragInfo.preview, 50)}]: Found {fragInfo.fragmentsCount} times totalling {fragInfo.stringifiedLength} characters ({fragInfo.percentOfTotalLength}%).</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div style={{ width: '100%' }}>
                {fragInfo.fragments.map((fragment, index) => (
                  <FragmentViewer key={index} fragment={fragment} />
                ))
                }
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        ))
        }
      </div>
    </div>
  );
}

type FragmentViewerProps = { fragment: JsonFragment };
const FragmentViewer = React.memo(
  ({ fragment }: FragmentViewerProps) => {
    const [expanded, setExpanded] = React.useState(false);
    const handleChange = React.useCallback((event, isExpanded) => {
      setExpanded(isExpanded);
    }, [setExpanded]);
    return <ExpansionPanel expanded={expanded} onChange={handleChange}>
      <ExpansionPanelSummary>
        <Typography>Path: {fragment.path.join('.')}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {expanded && <pre>
          {prettyJson(fragment.value)}
        </pre>
        }
      </ExpansionPanelDetails>
    </ExpansionPanel>
  });

const ellipsis = (string: string, maxLength: number = 100) => {
  if (string.length > maxLength) {
    return string.substr(0, maxLength - 1) + '…';
  } else {
    return string;
  }
}

function prettyJson(value: any): React.ReactNode {
  return JSON.stringify(value, null, '  ');
}


export default App;

