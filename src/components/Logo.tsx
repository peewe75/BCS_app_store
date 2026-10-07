import React from 'react';
export default function Logo({variant='dark',size='md'}:{variant?:'dark'|'light';size?:'sm'|'md'|'lg'}){
 const width=size==='lg'?112:size==='sm'?68:88;
 return <span style={{display:'inline-flex',background:variant==='dark'?'#153b32':'transparent',padding:'7px 10px',borderRadius:4}}><img src="/tools/swa/logo.webp" alt="SWA" width={width} height={Math.round(width*.44)}/></span>;
}
