import MandalaBackground from '../panels/MandalaBackground';

export default function Intro({ tea }:{ tea:{ name:string; category?:string; colorMain?:string; colorDark?:string } }) {
  return (
    <>
      <MandalaBackground color={tea.colorDark ?? '#000'} category={tea.category ?? ''} />
      <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden]">
        <img src="/mirachai_logo.svg" alt="" className="w-32" />
      </div>
    </>
  );
}