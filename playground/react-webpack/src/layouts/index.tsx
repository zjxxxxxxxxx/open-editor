import { Link, Outlet } from 'umi';
import '../opne';
import styles from './index.less';

export default function Layout() {
  return (
    <div className={styles.navs}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
        <li>
          <a target="_blank" href="https://github.com/zjxxxxxxxxx/open-editor">
            Github
          </a>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
