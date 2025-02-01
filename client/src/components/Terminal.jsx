import React, { useRef } from 'react';

const Terminal = ({ output }) => {
    const terminalRef = useRef(null);

    return (
        <div ref={terminalRef} style={{lineHeight: "1.4"}} className="terminal flex flex-1 w-full h-full flex-col bg-[#222] border-1 border-[#444] justify-end overflow-y-auto">
            <div className="output h-full p-3 text-white overflow-auto text-lg">
            {
                    output.stderr && (
                        output.stderr.split('\n').map((line) =>
                            line.startsWith('/box/script.js') ? 'File: Script.js' : line // Replace the line
                        ).map((line, index) => (
                            <div
                                className="!text-red-500 font-semibold text-sm"
                                key={index}
                                style={{ marginLeft: line.startsWith('    ') ? '20px' : '0' }}
                            >
                                {line.trim() === '' ? (
                                    <br />
                                ) : (
                                    <span className="!text-red-500">&gt; {line}</span>
                                )}
                            </div>
                        )))
                }
                {
                    output.stdout && (
                        output.stdout.split('^').map((line, index) => (
                            <div className='!text-[#66d9ef]  text-sm' key={index}>
                                <span className='!text-[#0f0] font-bold'>&gt;</span> {line}
                            </div>
                        ))
                    )
                }
                {
                    output.stderr === null && output.stdout === null && output.status && (
                        <div className="!text-red-600">
                            <span className="font-bold">&gt; {output.status}</span>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default Terminal;
