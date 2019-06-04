import { Typography } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import React from 'react';

import { JsonFragment } from '../analyzer/JsonFragment';
import { prettyStringify } from '../utils/prettyStringify';

export type FragmentViewerProps = { fragment: JsonFragment };
export const FragmentViewer = React.memo(
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
                    {prettyStringify(fragment.value)}
                </pre>
                }
            </ExpansionPanelDetails>
        </ExpansionPanel>
    });