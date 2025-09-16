export function Logo() {
  return (
    <div className="w-8 h-8 flex justify-center items-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <radialGradient
            id="grad1"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "rgb(0,100,255)", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "rgb(0,255,100)", stopOpacity: 1 }}
            />
          </radialGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              style={{ stopColor: "#4a90e2", stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#81c784", stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="url(#grad1)" />
        <text
          x="6"
          y="28"
          fontFamily="Arial, sans-serif"
          fontSize="10"
          fontWeight="bold"
          fill="#002D62"
        >
          Charge
        </text>
        <path
          d="M26 20 L 25 25 L 29 25 L 28 30"
          stroke="#F1C40F"
          strokeWidth="1.5"
          fill="none"
        />

        <text
          x="29"
          y="28"
          fontFamily="Arial, sans-serif"
          fontSize="10"
          fontWeight="bold"
          fill="#333"
        >
          Smart
        </text>
        <g transform="translate(42, 22) scale(0.08)">
            <path d="M10 40 L10 60 L0 60 L0 40 Z M30 35 L30 65 L40 65 L40 35 Z M10 48 L-10 48 L-10 52 L10 52Z" fill="#4a90e2" stroke="white" strokeWidth="5"/>
        </g>
      </svg>
    </div>
  );
}
