import { useEffect } from 'react';
import { motion } from 'framer-motion';
import MandalaBackground from '../panels/MandalaBackground';

export default function Intro({ layoutId, tea, onDone }:{ layoutId:string; tea:{ name:string; category?:string; colorMain?:string; colorDark?:string }, onDone:()=>void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      layoutId={layoutId}
      className="relative overflow-hidden rounded-2xl"
      style={{
        width: 'var(--brew-w)',
        height: 'var(--brew-h)',
        backgroundColor: tea.colorMain,
        transformStyle: 'preserve-3d',
      }}
      initial={{ rotateY: 180 }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <MandalaBackground color={tea.colorDark ?? '#000'} category={tea.category ?? ''} />
      <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden]">
        <img src="/mirachai_logo.svg" alt="" className="w-32" />
      </div>
    </motion.div>
  );
}