import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import SplitPane from "split-pane-react";
import "./MobileApp.css";

import "split-pane-react/esm/themes/default.css";
import MobileFAQ from "../mobileComponents/MobileFAQ/MobileFAQ.tsx"; // Import the FAQ component
import SearchBar from "../mobileComponents/MobileSearchBar/MobileSearchBar.tsx";
// import DecisionTreeChat from "../mobileComponents/MobileDecisionTreeChat/MobileDecisionTreeChat.tsx";
import Header from "../mobileComponents/MobileHeader/MobileHeader.tsx";
import CityPage from "../mobileComponents/MobileCityPage/MobileCityPage.tsx";
import JudgePage from "../mobileComponents/MobileJudgePage/MobileJudgePage.tsx";

function MobileApp() {
    const [sizes, setSizes] = useState(["70%", "30%"]);
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [currentLanguage, setCurrentLanguage] = useState("en");

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage) {
            setCurrentLanguage(savedLanguage);
        }
    }, []);

    const toggleChat = () => {
        setIsChatVisible((prev) => {
            const newSizes = prev ? ["100%", "0%"] : ["70%", "30%"];
            setSizes(newSizes);
            return !prev;
        });
    };

    const handleLanguageChange = (lang: string) => {
        setCurrentLanguage(lang);
        localStorage.setItem("language", lang); // Save language to localStorage
    };

    return (
        <Router>
            <div
                className='mobile-app'
                style={{ height: "calc(100vh - 84px)" }}
            >
                <Header
                    toggleChat={toggleChat}
                    currentLanguage={currentLanguage}
                    onLanguageChange={handleLanguageChange}
                />
                <Routes>
                    {/* Main SplitPane Layout */}
                    <Route
                        path='/'
                        element={
                            // <SplitPane
                            //     split='vertical'
                            //     sizes={sizes}
                            //     onChange={setSizes}
                            //     resizerSize={13}
                            //     sashRender={() => (
                            //         <div className='mobile-resizer-line' />
                            //     )}
                            // >
                            <div style={{ height: "100%", width: "100%" }}>
                                <SearchBar currentLanguage={currentLanguage} />
                            </div>
                            // {/* {isChatVisible && (
                            //     <div style={{ height: "100%" }}>
                            //         <DecisionTreeChat
                            //             currentLanguage={currentLanguage}
                            //         />
                            //     </div>
                            // )} */}
                            // </SplitPane>
                        }
                    />

                    {/* City Page */}
                    <Route
                        path='/city/:cityName'
                        element={
                            // <SplitPane
                            //     split='vertical'
                            //     sizes={sizes}
                            //     onChange={setSizes}
                            //     resizerSize={13}
                            //     sashRender={() => (
                            //         <div className='mobile-resizer-line' />
                            //     )}
                            // >
                            <div style={{ height: "100%" }}>
                                <CityPage currentLanguage={currentLanguage} />
                            </div>
                            // // {/* {isChatVisible && (
                            //     <div style={{ height: "100%" }}>
                            //         <DecisionTreeChat
                            //             currentLanguage={currentLanguage}
                            //         />
                            //     </div>
                            // )} */}
                            // </SplitPane>
                        }
                    />

                    {/* Judge Page */}
                    <Route
                        path='/judge/:judgeName'
                        element={
                            // <SplitPane
                            //     split='vertical'
                            //     sizes={sizes}
                            //     onChange={setSizes}
                            //     resizerSize={13}
                            //     sashRender={() => (
                            //         <div className='mobile-resizer-line' />
                            //     )}
                            // >
                            <div style={{ height: "100%" }}>
                                <JudgePage currentLanguage={currentLanguage} />
                            </div>
                            // {/* {isChatVisible && (
                            //     <div style={{ height: "100%" }}>
                            //         <DecisionTreeChat
                            //             currentLanguage={currentLanguage}
                            //         />
                            //     </div>
                            // )} */}
                            // </SplitPane>
                        }
                    />
                    <Route
                        path='/faq'
                        element={
                            <MobileFAQ
                                currentLanguage={currentLanguage}
                            ></MobileFAQ>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default MobileApp;
