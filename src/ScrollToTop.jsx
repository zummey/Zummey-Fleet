import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = (props) => {
    const location = useLocation();
    useEffect(() => {
        // The page content scrolls inside the <main> element, not window.
        // window.scrollTo has no effect when overflow-y-auto is on a child element.
        const el = document.getElementById("main-scroll-container");
        if (el) {
            el.scrollTo({ top: 0, behavior: "instant" });
        }
    }, [location.pathname]);

    return <>{props.children}</>;
};

export default ScrollToTop;
