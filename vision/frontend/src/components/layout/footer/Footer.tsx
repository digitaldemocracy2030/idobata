import FooterDd2030 from "./FooterDd2030";
import FooterGeneral from "./FooterGeneral";
import FooterIdobata from "./FooterIdobata";

const Footer = () => {
  return (
    <footer className="flex flex-col items-center w-full bg-white rounded-t-[32px] relative z-20">
      <FooterIdobata />
      <FooterDd2030 />
      <FooterGeneral />
    </footer>
  );
};

export default Footer;
