// Terminal.js
import React, { useRef, useState } from 'react';

const Terminal = ({ output }) => {
    const terminalRef = useRef(null);


    return (
        <div ref={terminalRef} className="terminal">
            <div className="output">
            {
                    output.stderr && (
                        output.stderr.split('\n').map((line) =>
                            line.startsWith('/box/script.js') ? 'File: Script.js' : line // Replace the line
                        ).map((line, index) => (
                            <div
                                className="output-error"
                                key={index}
                                style={{ marginLeft: line.startsWith('    ') ? '20px' : '0' }}
                            >
                                {line.trim() === '' ? (
                                    <br />
                                ) : (
                                    <span className="prompt-error">&gt; {line}</span>
                                )}
                            </div>
                        )))
                }
                {
                    output.stdout && (
                        output.stdout.split('^').map((line, index) => (
                            <div className='output-success' key={index}>
                                <span className='prompt-success'>&gt;</span> {line}
                            </div>
                        ))
                    )
                }
                {
                    output.stderr === null && output.stdout === null && output.status && (
                        <div className="output-error">
                            <span className="prompt-error">&gt; {output.status}</span>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default Terminal;
