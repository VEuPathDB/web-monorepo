import * as React from "react";

function SvgDownload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
      width="1em"
      height="1em"
      {...props}
    >
      <path
        d="M9.52 4.628v1.914c0 .105 0 .105.107.105h1.928c.27 0 .458.15.5.403a.464.464 0 01-.145.42l-.82.821-2.722 2.722c-.143.143-.308.215-.506.145a.608.608 0 01-.216-.142c-.888-.881-1.772-1.765-2.656-2.65-.298-.298-.597-.595-.894-.894-.215-.216-.208-.515.015-.714.1-.091.225-.111.354-.111h1.907c.112 0 .113 0 .113-.113v-3.3c0-.184.041-.351.183-.482a.524.524 0 01.36-.152c.648-.001 1.295-.004 1.942.001.32.003.55.264.55.614v1.413zM12.249 13.402H3.75a.693.693 0 010-1.386h8.498a.693.693 0 010 1.386z"
        fillRule="nonzero"
      />
    </svg>
  );
}

export default SvgDownload;
