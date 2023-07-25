import style from './style.module.css';

export const Child = ({ children }: React.PropsWithChildren) => {
  return <div className={[style.box]}>{children}</div>;
};
