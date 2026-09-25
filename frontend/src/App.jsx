/* ===== SOS confirmation box ===== */
.sos-confirm-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
    background: #fef2f2;
    border: 2px solid #dc2626;
    border-radius: 20px;
    margin: 12px auto;
    max-width: 320px;
}

.sos-confirm-text {
    font-size: 15px;
    font-weight: 700;
    color: #991b1b;
    margin: 0;
    text-align: center;
}

.sos-progress-bar {
    width: 100%;
    height: 10px;
    background: #fecaca;
    border-radius: 5px;
    overflow: hidden;
}

.sos-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #dc2626 0%, #991b1b 100%);
    transition: width 0.05s linear;
}

.sos-cancel-btn {
    padding: 10px 24px;
    border: 1px solid #dc2626;
    border-radius: 10px;
    background: #ffffff;
    color: #dc2626;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
}

.sos-cancel-btn:hover {
    background: #fef2f2;
}