import React from 'react';

const RequestForm: React.FC = () => {
    return (
        <div>
            <h2>Request Form</h2>
            <form>
                <div>
                    <label htmlFor="requestName">Request Name</label>
                    <input type="text" id="requestName" name="requestName" />
                </div>
                <div>
                    <label htmlFor="requestDetails">Details</label>
                    <textarea id="requestDetails" name="requestDetails"></textarea>
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default RequestForm;
