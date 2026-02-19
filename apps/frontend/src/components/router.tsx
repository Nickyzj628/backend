import { Route, Switch } from "wouter-preact";
import { routes } from "@/utils/routes";

const Router = () => {
	return (
		<Switch>
			{routes.map((route) => (
				<Route key={route.path} path={route.path} component={route.component} />
			))}
		</Switch>
	);
};

export default Router;
