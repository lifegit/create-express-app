import moduleAlias from 'module-alias';
moduleAlias.addAlias('@', __dirname);

// prettier-ignore
import App from '@/app';

App();
