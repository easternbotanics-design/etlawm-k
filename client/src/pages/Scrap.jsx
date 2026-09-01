import Ghost from "../components/FloatingGhost";
import LoaderTruck from "../components/LoaderTruck";
import LoaderHamster from "../components/LoaderHamster";
import LoaderHourGlass from "../components/LoaderHourGlass";
import VideoCardCarousel from "../components/HomePage/VideoCatalogue";

const Scrap = () => {
  return (
    <>
      <VideoCardCarousel />
      <Ghost />
      <LoaderTruck />
      <LoaderHamster />
      <LoaderHourGlass />
    </>
  );
};

export default Scrap;