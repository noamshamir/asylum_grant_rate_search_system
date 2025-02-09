import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./JudgePage.css";
import judgeData from "../../data/judge_grant_rates.json";
import DonutChart from "../DonutChart/DonutChart.tsx";
import Tooltip from "../Tooltip/Tooltip.tsx";

interface SingleJudge {
    city: string;
    judge_name: string;
    denied_percentage: string | number;
    granted_asylum_percentage: string | number;
    granted_other_relief_percentage: string | number;
    total_decisions: number;
}

interface JudgePageProps {
    currentLanguage: string;
}

const translations = {
    en: {
        judgeNotFound: "Judge not found",
        asylumGranted: "Asylum Granted",
        otherReliefGranted: "Other Relief Granted",
        denied: "Denied",
        averageRates: "Average Rates",
        judgeStats: "Judge Stats",
        judge: "Judge",
        outOf: "Out of",
        casesFor: "cases for",
        wereGrantedAsylum: "were granted asylum,",
        wereGrantedOtherRelief: "were granted other relief,",
        wereDenied: "were denied.",
        asylumGrantedInfo:
            "This is the percentage of cases this judge granted asylum.",
        otherReliefInfo:
            "This is the percentage of cases this judge granted other relief, such as withholding of removal or CAT.",
        deniedInfo: "This is the percentage of cases this judge denied.",
    },
    es: {
        judgeNotFound: "Juez no encontrado",
        asylumGranted: "Asilo Otorgado",
        otherReliefGranted: "Otro Alivio Otorgado",
        denied: "Denegado",
        averageRates: "Tasas Promedio",
        judgeStats: "Estadísticas del Juez",
        judge: "Juez",
        outOf: "De",
        casesFor: "casos de",
        wereGrantedAsylum: "fueron otorgados asilo,",
        wereGrantedOtherRelief: "fueron otorgados otro alivio,",
        wereDenied: "fueron denegados.",
        asylumGrantedInfo:
            "Este es el porcentaje de casos en los que este juez otorgó asilo.",
        otherReliefInfo:
            "Este es el porcentaje de casos en los que este juez otorgó otro alivio, como la suspensión de la deportación o CAT.",
        deniedInfo:
            "Este es el porcentaje de casos en los que este juez denegó la solicitud.",
    },
    ht: {
        judgeNotFound: "Jij pa jwenn",
        asylumGranted: "Azil Akòde",
        otherReliefGranted: "Lòt Sekou Akòde",
        denied: "Refize",
        averageRates: "To Mwayèn",
        judgeStats: "Estatistik Jij",
        judge: "Jij",
        outOf: "Soti nan",
        casesFor: "ka pou",
        wereGrantedAsylum: "te akòde azil,",
        wereGrantedOtherRelief: "te akòde lòt sekou,",
        wereDenied: "te refize.",
        asylumGrantedInfo: "Sa a se pousantaj ka jij sa a te akòde azil.",
        otherReliefInfo:
            "Sa a se pousantaj ka jij sa a te akòde lòt sekou, tankou retansyon ekspilsyon oswa CAT.",
        deniedInfo: "Sa a se pousantaj ka jij sa a te refize.",
    },
};

const parsePercentage = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    if (!value) return 0;
    return parseFloat(value.toString().replace(/[^0-9.]/g, "")) || 0;
};

function JudgePage({ currentLanguage }: JudgePageProps) {
    const params = useParams<{ judgeName: string }>();
    const judgeNameParam = params.judgeName;

    // Flatten all judges from judgeData (which is keyed by city).
    const allJudges: SingleJudge[] = Object.values(judgeData).flatMap(
        (cityObj) => Object.values(cityObj)
    ) as SingleJudge[];

    // Find the specific judge by name
    const theJudge = allJudges.find(
        (j) => j.judge_name.toLowerCase() === judgeNameParam?.toLowerCase()
    );

    // If judge isn't found, display an error or placeholder
    if (!theJudge) {
        return (
            <div className='judge-page'>
                <h2>{translations[currentLanguage].judgeNotFound}</h2>
            </div>
        );
    }

    // Convert string percentages to numbers
    const asylumRate = parsePercentage(theJudge.granted_asylum_percentage);
    const otherReliefRate = parsePercentage(
        theJudge.granted_other_relief_percentage
    );
    const deniedRate = parsePercentage(theJudge.denied_percentage);
    const totalDecisions = Number(theJudge.total_decisions);

    // Calculate actual numbers of cases
    const asylumGrantedAmount = Math.round((totalDecisions * asylumRate) / 100);
    const otherGrantedAmount = Math.round(
        (totalDecisions * otherReliefRate) / 100
    );
    const deniedAmount = Math.round((totalDecisions * deniedRate) / 100);

    return (
        <div className='judge-page'>
            {/* Header Section */}
            <div className='judge-header-section'>
                <div className='judge-title-description'>
                    <h2 className='judge-section-header judge-title'>
                        {theJudge.judge_name}
                    </h2>
                    <h1 className='judge-descriptor judge-label'>
                        {translations[currentLanguage].judge}
                    </h1>
                    <Link to={`/city/${theJudge.city}`}>
                        <h3 className='judge-descriptor judge-city'>
                            {theJudge.city}
                        </h3>
                    </Link>
                </div>
            </div>

            {/* Rates Section */}
            <div className='judge-rates-section'>
                <h2 className='judge-section-header judge-rates'>
                    {translations[currentLanguage].averageRates}
                </h2>
                <div className='judge-donut-charts-container'>
                    {/* Asylum Granted */}
                    <div className='judge-asylum-granted-section'>
                        <div className='judge-donut-chart-div'>
                            <DonutChart
                                title={
                                    translations[currentLanguage].asylumGranted
                                }
                                percentage={asylumRate}
                                className='judge-asylum-granted-donut-chart'
                                size={110}
                                strokeWidth={13}
                                color={"#C5FBA3"}
                            />
                        </div>
                        <div className='judge-donut-chart-description'>
                            <p>{translations[currentLanguage].asylumGranted}</p>
                            <Tooltip
                                text={
                                    translations[currentLanguage]
                                        .asylumGrantedInfo
                                }
                            >
                                <span className='judge-info-icon'>
                                    <i className='fas fa-info-circle'></i>
                                </span>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Other Relief Granted */}
                    <div className='judge-other-relief-section'>
                        <div className='judge-donut-chart-div'>
                            <DonutChart
                                title={
                                    translations[currentLanguage]
                                        .otherReliefGranted
                                }
                                percentage={otherReliefRate}
                                className='judge-other-relief-donut-chart'
                                size={110}
                                strokeWidth={13}
                                color={"#C5FBA3"}
                            />
                        </div>
                        <div className='judge-donut-chart-description'>
                            <p>
                                {
                                    translations[currentLanguage]
                                        .otherReliefGranted
                                }
                            </p>
                            <Tooltip
                                text={
                                    translations[currentLanguage]
                                        .otherReliefInfo
                                }
                            >
                                <span className='judge-info-icon'>
                                    <i className='fas fa-info-circle'></i>
                                </span>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Denied */}
                    <div className='judge-denied-section'>
                        <div className='judge-donut-chart-div'>
                            <DonutChart
                                title={translations[currentLanguage].denied}
                                percentage={deniedRate}
                                className='judge-denied-donut-chart'
                                size={110}
                                strokeWidth={13}
                                color={"#FF7A7A"}
                            />
                        </div>
                        <div className='judge-donut-chart-description'>
                            <p>{translations[currentLanguage].denied}</p>
                            <Tooltip
                                text={translations[currentLanguage].deniedInfo}
                            >
                                <span className='judge-info-icon'>
                                    <i className='fas fa-info-circle'></i>
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className='judge-stats-section'>
                <h2 className='judge-section-header judge-stats'>
                    {translations[currentLanguage].judgeStats}
                </h2>
                <div className='judge-statistics'>
                    <p>
                        {translations[currentLanguage].outOf}{" "}
                        <span className='judge-cases-amount'>
                            {totalDecisions}
                        </span>{" "}
                        {translations[currentLanguage].casesFor}{" "}
                        <strong>{theJudge.judge_name}</strong>,{" "}
                        <span className='judge-asylum-granted'>
                            {asylumGrantedAmount}
                        </span>{" "}
                        {translations[currentLanguage].wereGrantedAsylum}{" "}
                        <span className='judge-other-granted'>
                            {otherGrantedAmount}
                        </span>{" "}
                        {translations[currentLanguage].wereGrantedOtherRelief}{" "}
                        <span className='judge-denied-amount'>
                            {deniedAmount}
                        </span>{" "}
                        {translations[currentLanguage].wereDenied}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default JudgePage;
