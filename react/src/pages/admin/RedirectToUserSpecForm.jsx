import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RedirectToUserSpecForm() {
    const { acteur } = useParams();

    const navigate = useNavigate();

    useEffect(() => {
        switch (acteur) {
            case "cdc":
                navigate("/dashboard/create-user/cdc");
                break;

            case "drif":
                navigate("/dashboard/create-user/drif");

            case "participant":
                navigate("/dashboard/create-user/participant");

            case "dr":
                navigate("/dashboard/create-user/dr");

            case "animateur":
                navigate("/dashboard/create-user/animateur");

            default:
                navigate("/dashboard/create-user");
                break;
        }
    }, []);

    return (
        <div>
            <h1>RedirectToUserSpecForm</h1>
        </div>
    );
}

export default RedirectToUserSpecForm;
