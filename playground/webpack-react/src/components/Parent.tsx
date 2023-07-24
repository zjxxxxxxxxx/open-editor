import { Child } from './Child';
import style from './style.module.css';

export const Parent = ({ children }: React.PropsWithChildren) => {
  return (
    <div className={[style.box, style.parent]}>
      <div className={[style.box, style.child]}>
        <Child>ChildLeft</Child>
      </div>
      {children}
    </div>
  );
};
