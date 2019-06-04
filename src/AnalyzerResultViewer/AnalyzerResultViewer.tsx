import { Typography } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import React, { ChangeEvent } from 'react';

import { AnalyzerResult } from "../analyzer/AnalyzerResult";
import { FragmentViewer } from './FragmentViewer';
import { ellipsis } from '../utils/ellipsis';

export type AnalyzerResultViewerProps = {
    result: AnalyzerResult
};
export const AnalyzerResultViewer = React.memo(({ result }: AnalyzerResultViewerProps) => {
    return <>
        <Typography variant="body2">
            Original JSON is {result.compactJsonLength} characters ({result.originalJsonLength} before compact rewrite).</Typography>
        <Typography variant="body2">
            Found {result.fragmentsInfo.length} duplicated fragments.
      </Typography>
        <div>
            {result.fragmentsInfo.map((fragInfo, index) => (
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
        </div></>;
});