import styled from "styled-components";

export default function BurgerMenu({
  isOpen = false,
  onToggle,
  color = "#171717",
}) {
  return (
    <StyledWrapper $color={color}>
      <button
        type="button"
        className={`burger ${isOpen ? "is-open" : ""}`}
        onClick={onToggle}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
      >
        <span />
        <span />
        <span />
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: relative;
  z-index: 1;

  .burger {
    position: relative;
    display: block;
    width: 40px;
    height: 40px;
    margin-left: -9px;
    padding: 0;
    border: 0;
    color: inherit;
    cursor: pointer;
    background: transparent;
    -webkit-tap-highlight-color: transparent;
  }

  .burger span {
    position: absolute;
    left: 9px;
    display: block;
    height: 1px;
    border-radius: 999px;
    background: ${({ $color }) => $color};
    transform-origin: center;
    transition:
      top 360ms cubic-bezier(0.22, 1, 0.36, 1),
      width 300ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 200ms ease,
      background-color 300ms ease;
  }

  .burger span:nth-child(1) {
    top: 14px;
    width: 22px;
  }

  .burger span:nth-child(2) {
    top: 20px;
    width: 17px;
  }

  .burger span:nth-child(3) {
    top: 26px;
    width: 22px;
  }

  .burger:hover span:nth-child(2) {
    width: 22px;
  }

  .burger.is-open span:nth-child(1) {
    top: 20px;
    width: 22px;
    transform: rotate(45deg);
  }

  .burger.is-open span:nth-child(2) {
    width: 0;
    opacity: 0;
  }

  .burger.is-open span:nth-child(3) {
    top: 20px;
    width: 22px;
    transform: rotate(-45deg);
  }

  .burger:focus-visible {
    outline: 1px solid ${({ $color }) => $color};
    outline-offset: -5px;
  }
`;