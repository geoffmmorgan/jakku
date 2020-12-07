import './style.css';
import Home from './pages/home/home';
import SpatialNavigation from './services/spatial-navigation.service';

Home.render().then(() => SpatialNavigation.initialize());