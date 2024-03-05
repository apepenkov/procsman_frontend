import React, { createContext, useContext, useState } from 'react';
import {Tooltip, OverlayTrigger} from "react-bootstrap";
import "./tooltip.css";

const GuideModeContext = createContext();


export function WrapInTooltip({ children, text, placement=undefined, zindex=1054, dummy=false, style=undefined}) {
    const { guideMode } = useGuideMode();
    if (dummy) {
        return children;
    }
    return (
        <OverlayTrigger
            placement={placement}
            overlay={<Tooltip style={{zIndex: zindex, ...style}} className="custom-tooltip">{text}</Tooltip>}
            show={guideMode}
        >
            {children}
        </OverlayTrigger>
    );
}

export function useGuideMode() {
    return useContext(GuideModeContext);
}

export const GuideModeProvider = ({ children }) => {
    const [guideMode, setGuideMode] = useState(false);

    return (
        <GuideModeContext.Provider value={{ guideMode, setGuideMode }}>
            {children}
        </GuideModeContext.Provider>
    );
};