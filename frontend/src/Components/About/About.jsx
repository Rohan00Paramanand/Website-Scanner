import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css"; // We'll create this next

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="about-container">
            <button className="back-button" onClick={() => navigate("/")}>
                &larr; Back to Home
            </button>

            <div className="about-content">
                <h1>About Privacy Dashboard</h1>

                <section>
                    <h2>Why This Project Exists</h2>
                    <p>
                        In an era where digital privacy is constantly under threat, understanding what happens behind the scenes when you visit a website is crucial.
                        Many websites track your behavior, collect data through cookies, and load third-party scripts without your explicit knowledge.
                        This Privacy Dashboard was created to empower users by shedding light on these hidden practices.
                    </p>
                </section>

                <section>
                    <h2>Why It Is Necessary</h2>
                    <p>
                        <strong>Transparency:</strong> Users deserve to know who is tracking them.
                        <br />
                        <strong>Security:</strong> Excessive third-party scripts can introduce security vulnerabilities.
                        <br />
                        <strong>Performance:</strong> Heavy tracking scripts often slow down website performance.
                        <br />
                        <strong>Control:</strong> Armed with this information, users can make informed decisions about which sites to trust.
                    </p>
                </section>

                <section>
                    <h2>How Scanning & Grading Works</h2>
                    <p>
                        Our scanner uses an automated browser engine to visit the target URL, simulating a real user visit. During this process, we analyze:
                    </p>
                    <ul>
                        <li><strong>Cookies:</strong> We count the number of cookies dropped on your browser.</li>
                        <li><strong>Third-Party Scripts:</strong> We identify scripts loaded from domains other than the website's main domain.</li>
                        <li><strong>Trackers:</strong> We cross-reference loaded scripts with known tracker databases.</li>
                    </ul>

                    <h3>Grading System</h3>
                    <div className="grading-scale">
                        <div className="grade-item"><span className="grade-badge A">A</span> <span className="grade-desc">Excellent privacy. Few to no trackers.</span></div>
                        <div className="grade-item"><span className="grade-badge B">B</span> <span className="grade-desc">Good. Some necessary cookies/scripts.</span></div>
                        <div className="grade-item"><span className="grade-badge C">C</span> <span className="grade-desc">Average. Moderate amount of tracking.</span></div>
                        <div className="grade-item"><span className="grade-badge D">D</span> <span className="grade-desc">Poor. Heavy tracking detected.</span></div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
