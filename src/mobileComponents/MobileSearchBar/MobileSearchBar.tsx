import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./MobileSearchBar.css";
import DropdownMenu from "../MobileDropdownMenu/MobileDropdownMenu.tsx";
import judgeData from "../../data/judge_grant_rates.json";
import CityCard from "../MobileCityCard/MobileCityCard.tsx";
import JudgeCard from "../MobileJudgeCard/MobileJudgeCard.tsx";
import Tooltip from "../MobileTooltip/MobileTooltip.tsx";

// Interfaces
interface Judge {
    city: string;
    judge_name: string;
    denied_percentage: string;
    granted_asylum_percentage: string;
    granted_other_relief_percentage: string;
    total_decisions: string;
}

interface CityDictionary {
    [judgeName: string]: Judge;
}

interface AllCities {
    [cityName: string]: CityDictionary;
}

interface AllJudges {
    [judgeName: string]: Judge;
}

interface SearchBarProps {
    currentLanguage: string;
}

/**
 * Define a type for the "internal" sort keys
 */
type SortKey =
    | "approvalHigh"
    | "approvalLow"
    | "casesHigh"
    | "casesLow"
    | "alphaAsc"
    | "alphaDesc";

/**
 * We store the labels in English & Spanish, and
 * link them to an internal `SortKey` string.
 */
const SORT_OPTIONS = [
    {
        value: "approvalHigh",
        en: "Approval Rate (High to Low)",
        es: "Tasa de Aprobación (Alta a Baja)",
        ht: "To Apwobasyon (Wo a Ba)",
    },
    {
        value: "approvalLow",
        en: "Approval Rate (Low to High)",
        es: "Tasa de Aprobación (Baja a Alta)",
        ht: "To Apwobasyon (Ba a Wo)",
    },
    {
        value: "casesHigh",
        en: "Amount of Cases (High to Low)",
        es: "Cantidad de Casos (Alta a Baja)",
        ht: "Kantite Ka (Wo a Ba)",
    },
    {
        value: "casesLow",
        en: "Amount of Cases (Low to High)",
        es: "Cantidad de Casos (Baja a Alta)",
        ht: "Kantite Ka (Ba a Wo)",
    },
    {
        value: "alphaAsc",
        en: "Alphabetical (A to Z)",
        es: "Alfabético (A a Z)",
        ht: "Alfabètik (A rive Z)",
    },
    {
        value: "alphaDesc",
        en: "Reverse Alphabetical (Z to A)",
        es: "Alfabético Inverso (Z a A)",
        ht: "Alfabètik Ranvèse (Z rive A)",
    },
];

function SearchBar({ currentLanguage }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(true);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const navigate = useNavigate();

    /**
     * Instead of storing the entire label in state,
     * we store the "internal" key, e.g. "approvalHigh".
     * Default = "alphaAsc"
     */
    const [sortOption, setSortOption] = useState<SortKey>("approvalHigh");

    const dropdownOptions = SORT_OPTIONS.map((opt) => ({
        value: opt.value,
        label:
            currentLanguage === "en"
                ? opt.en
                : currentLanguage === "es"
                ? opt.es
                : opt.ht, // Use Haitian Creole translation
    }));

    // JSON data
    const allCities: AllCities = judgeData;
    const allJudges: AllJudges = Object.keys(allCities).reduce(
        (acc, cityName) => {
            const judges = allCities[cityName];
            for (const judgeName in judges) {
                acc[judgeName] = judges[judgeName];
            }
            return acc;
        },
        {} as AllJudges
    );

    // Translations for other UI text
    const translations = {
        en: {
            placeholder: "Search judge/city...",
            citiesLabel: "Cities",
            judgesLabel: "Judges",
            filterOptions: "Filter Options",
            sortBy: "Sort by",
            tooltipText: (
                <>
                    Find the asylum grant percentages/rates of your judge or
                    city by searching for them in the search bar. For more info,
                    check out our <Link to='/faq'>FAQ page</Link>.
                </>
            ),
            noResults: {
                main: "Couldn't find these results. Not all judges are in our system.",
                help: "Need help? Visit our ",
                page: "Frequently Asked Questions page",
            },
        },
        es: {
            placeholder: "Buscar juez/ciudad...",
            citiesLabel: "Ciudades",
            judgesLabel: "Jueces",
            filterOptions: "Opciones de Filtro",
            sortBy: "Ordenar",
            tooltipText: (
                <>
                    Encuentra los porcentajes/tasas de concesión de asilo de tu
                    juez o ciudad buscándolos en la barra de búsqueda. Para más
                    información, visita{" "}
                    <Link to='/faq'>
                        nuestra página de Preguntas Frecuentes
                    </Link>
                    .
                </>
            ),
            noResults: {
                main: "No se pudieron encontrar estos resultados. No todos los jueces están en nuestro sistema.",
                help: "¿Necesitas ayuda? Visita nuestra ",
                page: "página de Preguntas Frecuentes",
            },
        },
        ht: {
            placeholder: "Rechèch jij/vil...",
            citiesLabel: "Vil",
            judgesLabel: "Jij",
            filterOptions: "Opsyon Filtre",
            sortBy: "Triye pa",
            tooltipText: (
                <>
                    Rechèch pousantaj ak to koncesyon azil jij ou oswa vil ou a
                    lè w antre non yo nan ba rechèch la. Pou plis enfòmasyon,
                    ale nan <Link to='/faq'>paj Kesyon yo Poze Souvan</Link>.
                </>
            ),
            noResults: {
                main: "Nou pa jwenn rezilta sa yo. Pa tout jij ki nan sistèm nou an.",
                help: "Bezwen èd? Ale nan ",
                page: "paj Kesyon yo Poze Souvan",
            },
        },
    };

    const {
        placeholder,
        citiesLabel,
        judgesLabel,
        filterOptions,
        tooltipText,
        noResults,
        sortBy,
    } = translations[currentLanguage] || translations.en;

    /* ---------------------------------------------------
     *  Helpers to get numeric metrics for Judges and Cities
     * --------------------------------------------------- */
    // For a single Judge
    const getApprovalRate = (j: Judge): number => {
        const asylum = parseFloat(j.granted_asylum_percentage);
        const other = parseFloat(j.granted_other_relief_percentage);
        return asylum + other;
    };

    const getCaseCount = (j: Judge): number => {
        return parseInt(j.total_decisions, 10);
    };

    // For an entire city, we compute the average approval & total cases
    const getCityApprovalRate = (cityName: string): number => {
        const judgesInCity = allCities[cityName];
        let totalApproval = 0;
        let judgeCount = 0;
        for (const judgeName in judgesInCity) {
            totalApproval += getApprovalRate(judgesInCity[judgeName]);
            judgeCount++;
        }
        return judgeCount === 0 ? 0 : totalApproval / judgeCount;
    };

    const getCityTotalCases = (cityName: string): number => {
        const judgesInCity = allCities[cityName];
        let sumCases = 0;
        for (const judgeName in judgesInCity) {
            sumCases += getCaseCount(judgesInCity[judgeName]);
        }
        return sumCases;
    };

    const searchBarInfo =
        currentLanguage === "en"
            ? `Find the asylum grant percentages/rates of your judge or city by searching for them in the search bar. For more info, use the info chat on the right`
            : `Encuentra los porcentajes/tasas de concesión de asilo de tu juez o ciudad buscándolos en la barra de búsqueda. Para más información, utiliza el chat de información a la derecha.`;

    /* --------------------------
     *  Filter results by search
     * -------------------------- */
    let cityResults: string[] = [];
    let judgeResults: Judge[] = [];

    if (!searchTerm.trim()) {
        // If no search term, include all
        cityResults = Object.keys(allCities);
        judgeResults = Object.values(allJudges);
    } else {
        const lowerSearch = searchTerm.toLowerCase();
        for (const cityName in allCities) {
            if (cityName.toLowerCase().includes(lowerSearch)) {
                cityResults.push(cityName);
            }
        }
        for (const judgeName in allJudges) {
            if (judgeName.toLowerCase().includes(lowerSearch)) {
                judgeResults.push(allJudges[judgeName]);
            }
        }
    }

    /* --------------------------
     *  Sorting logic (based on the 'sortOption' key)
     * -------------------------- */
    switch (sortOption) {
        case "approvalHigh":
            // Judges: sort by approval descending
            judgeResults.sort(
                (a, b) => getApprovalRate(b) - getApprovalRate(a)
            );
            // Cities: sort by average approval descending
            cityResults.sort(
                (cityA, cityB) =>
                    getCityApprovalRate(cityB) - getCityApprovalRate(cityA)
            );
            break;

        case "approvalLow":
            judgeResults.sort(
                (a, b) => getApprovalRate(a) - getApprovalRate(b)
            );
            cityResults.sort(
                (cityA, cityB) =>
                    getCityApprovalRate(cityA) - getCityApprovalRate(cityB)
            );
            break;

        case "casesHigh":
            judgeResults.sort((a, b) => getCaseCount(b) - getCaseCount(a));
            cityResults.sort(
                (cityA, cityB) =>
                    getCityTotalCases(cityB) - getCityTotalCases(cityA)
            );
            break;

        case "casesLow":
            judgeResults.sort((a, b) => getCaseCount(a) - getCaseCount(b));
            cityResults.sort(
                (cityA, cityB) =>
                    getCityTotalCases(cityA) - getCityTotalCases(cityB)
            );
            break;

        case "alphaAsc":
            cityResults.sort((a, b) => a.localeCompare(b));
            judgeResults.sort((a, b) =>
                a.judge_name.localeCompare(b.judge_name)
            );
            break;

        case "alphaDesc":
            cityResults.sort((a, b) => b.localeCompare(a));
            judgeResults.sort((a, b) =>
                b.judge_name.localeCompare(a.judge_name)
            );
            break;

        default:
            // fallback
            cityResults.sort((a, b) => a.localeCompare(b));
            judgeResults.sort((a, b) =>
                a.judge_name.localeCompare(b.judge_name)
            );
            break;
    }

    const handleSearchIconClick = () => {
        navigate("/");
    };

    return (
        <div className='mobile-search-bar-container'>
            <div className='mobile-search-bar'>
                <input
                    type='text'
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder={placeholder}
                />
                <div className='mobile-search-actions'>
                    {/* <span
                        className='mobile-clear-icon'
                        onClick={() => {
                            setSearchTerm("");
                            if (!searchTerm.trim()) {
                                setIsDropdownOpen(false);
                            }
                        }}
                    > */}
                    {/* <i className='mobile-fas fa-times'></i>
                    </span> */}
                    <div className='mobile-divider' />
                    <span
                        className='mobile-filter-icon'
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        <i className='fas fa-sliders-h'></i>
                    </span>
                    <div className='mobile-tooltip-container-search'>
                        <Tooltip
                            position='below' // Adjust position dynamically if needed
                            text={tooltipText} // Tooltip content
                        >
                            <span className='mobile-info-icon'>
                                <i className='fas fa-info-circle'></i>{" "}
                                {/* Info icon */}
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>
            {showFilterMenu && (
                <div className='mobile-filter-menu'>
                    <div className='mobile-filter-header'>
                        <span className='mobile-filter-header-title'>
                            {filterOptions}
                        </span>
                        <span
                            className='mobile-clear-icon filter-box-icon'
                            onClick={() => setShowFilterMenu(false)}
                        >
                            <i className='fas fa-times'></i>
                        </span>
                    </div>
                    <div className='mobile-filter-body'>
                        <span className='mobile-sort-by-text'>{sortBy}:</span>
                        <div className='mobile-dropdown-menu-div'>
                            <DropdownMenu
                                options={dropdownOptions}
                                selectedValue={sortOption}
                                onSelect={(selectedValue) =>
                                    setSortOption(selectedValue as SortKey)
                                }
                            />
                        </div>
                    </div>
                </div>
            )}
            {isDropdownOpen &&
            (cityResults.length > 0 || judgeResults.length > 0) ? (
                <>
                    <hr className='mobile-horizontal-divider' />
                    <div className='mobile-search-results-dropdown'>
                        {cityResults.length > 0 && (
                            <>
                                <h4>{citiesLabel}</h4>
                                {cityResults.map((cityName) => {
                                    const judgeCount = Object.keys(
                                        allCities[cityName]
                                    ).length;
                                    return (
                                        <CityCard
                                            currentLanguage={currentLanguage}
                                            key={cityName}
                                            city={cityName}
                                            judgeCount={judgeCount}
                                        />
                                    );
                                })}
                            </>
                        )}
                        {judgeResults.length > 0 && (
                            <>
                                <h4>{judgesLabel}</h4>
                                {judgeResults.map((judge) => (
                                    <JudgeCard
                                        currentLanguage={currentLanguage}
                                        key={judge.judge_name}
                                        judge={judge}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <hr className='mobile-horizontal-divider' />
                    <div className='mobile-no-results'>
                        <div className='mobile-no-results-text'>
                            <p>{noResults.main}</p>
                            <p>
                                {noResults.help}
                                <Link to='/faq'>{noResults.page}</Link>.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default SearchBar;
