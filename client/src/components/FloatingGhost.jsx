import React from 'react';

const Ghost = () => {
  return (
    <div className="ghost-loader-wrapper">
      <div className="ghost">
        <div className="ghost__red">
          <div className="ghost__pupil ghost__pupil--left" />
          <div className="ghost__pupil ghost__pupil--right" />
          <div className="ghost__eye ghost__eye--left" />
          <div className="ghost__eye ghost__eye--right" />
          <div className="ghost__top ghost__top--0" />
          <div className="ghost__top ghost__top--1" />
          <div className="ghost__top ghost__top--2" />
          <div className="ghost__top ghost__top--3" />
          <div className="ghost__top ghost__top--4" />
          <div className="ghost__st ghost__st--0" />
          <div className="ghost__st ghost__st--1" />
          <div className="ghost__st ghost__st--2" />
          <div className="ghost__st ghost__st--3" />
          <div className="ghost__st ghost__st--4" />
          <div className="ghost__st ghost__st--5" />
          <div className="ghost__an ghost__an--1" />
          <div className="ghost__an ghost__an--2" />
          <div className="ghost__an ghost__an--3" />
          <div className="ghost__an ghost__an--4" />
          <div className="ghost__an ghost__an--5" />
          <div className="ghost__an ghost__an--6" />
          <div className="ghost__an ghost__an--7" />
          <div className="ghost__an ghost__an--8" />
          <div className="ghost__an ghost__an--9" />
          <div className="ghost__an ghost__an--10" />
          <div className="ghost__an ghost__an--11" />
          <div className="ghost__an ghost__an--12" />
          <div className="ghost__an ghost__an--13" />
          <div className="ghost__an ghost__an--14" />
          <div className="ghost__an ghost__an--15" />
          <div className="ghost__an ghost__an--16" />
          <div className="ghost__an ghost__an--17" />
          <div className="ghost__an ghost__an--18" />
        </div>
        <div className="ghost__shadow" />
      </div>

      <style>{`
        .ghost-loader-wrapper {
          display: contents;
        }

        .ghost {
          position: relative;
          scale: 0.8;
        }

        .ghost__red {
          animation: ghost-up-down infinite 0.5s;
          position: relative;
          width: 140px;
          height: 140px;
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          grid-template-rows: repeat(14, 1fr);
          grid-column-gap: 0px;
          grid-row-gap: 0px;
          grid-template-areas:
            "a1  a2  a3  a4  a5  top0  top0  top0  top0  a10 a11 a12 a13 a14"
            "b1  b2  b3  top1 top1 top1 top1 top1 top1 top1 top1 b12 b13 b14"
            "c1 c2 top2 top2 top2 top2 top2 top2 top2 top2 top2 top2 c13 c14"
            "d1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 d14"
            "e1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 e14"
            "f1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 f14"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "st0 st0 an4 st1 an7 st2 an10 an10 st3 an13 st4 an16 st5 st5"
            "an1 an2 an3 an5 an6 an8 an9 an9 an11 an12 an14 an15 an17 an18";
        }

        @keyframes ghost-up-down {
          0%, 49% { transform: translateY(0px); }
          50%, 100% { transform: translateY(-10px); }
        }

        .ghost__top,
        .ghost__st {
          background-color: red;
        }

        .ghost__top--0 { grid-area: top0; }
        .ghost__top--1 { grid-area: top1; }
        .ghost__top--2 { grid-area: top2; }
        .ghost__top--3 { grid-area: top3; }
        .ghost__top--4 { grid-area: top4; }

        .ghost__st--0 { grid-area: st0; }
        .ghost__st--1 { grid-area: st1; }
        .ghost__st--2 { grid-area: st2; }
        .ghost__st--3 { grid-area: st3; }
        .ghost__st--4 { grid-area: st4; }
        .ghost__st--5 { grid-area: st5; }

        .ghost__an--1  { grid-area: an1;  animation: ghost-flicker-0 infinite 0.5s; }
        .ghost__an--18 { grid-area: an18; animation: ghost-flicker-0 infinite 0.5s; }
        .ghost__an--2  { grid-area: an2;  animation: ghost-flicker-1 infinite 0.5s; }
        .ghost__an--17 { grid-area: an17; animation: ghost-flicker-1 infinite 0.5s; }
        .ghost__an--3  { grid-area: an3;  animation: ghost-flicker-1 infinite 0.5s; }
        .ghost__an--16 { grid-area: an16; animation: ghost-flicker-1 infinite 0.5s; }
        .ghost__an--4  { grid-area: an4;  animation: ghost-flicker-1 infinite 0.5s; }
        .ghost__an--15 { grid-area: an15; animation: ghost-flicker-1 infinite 0.5s; }
        .ghost__an--6  { grid-area: an6;  animation: ghost-flicker-0 infinite 0.5s; }
        .ghost__an--12 { grid-area: an12; animation: ghost-flicker-0 infinite 0.5s; }
        .ghost__an--7  { grid-area: an7;  animation: ghost-flicker-0 infinite 0.5s; }
        .ghost__an--13 { grid-area: an13; animation: ghost-flicker-0 infinite 0.5s; }
        .ghost__an--9  { grid-area: an9;  animation: ghost-flicker-1 infinite 0.5s; }
        .ghost__an--10 { grid-area: an10; animation: ghost-flicker-1 infinite 0.5s; }
        .ghost__an--8  { grid-area: an8;  animation: ghost-flicker-0 infinite 0.5s; }
        .ghost__an--11 { grid-area: an11; animation: ghost-flicker-0 infinite 0.5s; }
        .ghost__an--5  { grid-area: an5; }
        .ghost__an--14 { grid-area: an14; }

        @keyframes ghost-flicker-0 {
          0%, 49% { background-color: red; }
          50%, 100% { background-color: transparent; }
        }

        @keyframes ghost-flicker-1 {
          0%, 49% { background-color: transparent; }
          50%, 100% { background-color: red; }
        }

        .ghost__eye {
          width: 40px;
          height: 50px;
          position: absolute;
          top: 30px;
        }

        .ghost__eye--left { left: 10px; }
        .ghost__eye--right { right: 30px; }

        .ghost__eye::before {
          content: "";
          background-color: white;
          width: 20px;
          height: 50px;
          transform: translateX(10px);
          display: block;
          position: absolute;
        }

        .ghost__eye::after {
          content: "";
          background-color: white;
          width: 40px;
          height: 30px;
          transform: translateY(10px);
          display: block;
          position: absolute;
        }

        .ghost__pupil {
          width: 20px;
          height: 20px;
          background-color: blue;
          position: absolute;
          top: 50px;
          z-index: 1;
          animation: ghost-eyes-movement infinite 3s;
        }

        .ghost__pupil--left { left: 10px; }
        .ghost__pupil--right { right: 50px; }

        @keyframes ghost-eyes-movement {
          0%, 49% { transform: translateX(0px); }
          50%, 99% { transform: translateX(10px); }
          100% { transform: translateX(0px); }
        }

        .ghost__shadow {
          background-color: black;
          width: 140px;
          height: 140px;
          position: absolute;
          border-radius: 50%;
          transform: rotateX(80deg);
          filter: blur(20px);
          top: 80%;
          animation: ghost-shadow-movement infinite 0.5s;
        }

        @keyframes ghost-shadow-movement {
          0%, 49% { opacity: 0.5; }
          50%, 100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default Ghost;