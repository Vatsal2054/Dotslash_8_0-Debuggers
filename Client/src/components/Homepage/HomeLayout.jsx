import { Outlet } from "react-router";
import SideMenu from "./SideBar";
import Header from "./Header";
import Container from "../UI/Container";

export default function HomeLayout({ role, children }) {
    return (
        <main className="h-[100vh] flex flex-col bg-background-greyLight dark:bg-background-dark">
            <Header />
            <main className="h-[100%] flex flex-row">
                <SideMenu role={role} />
                <div className="flex-1 pr-4 pb-4">
                    <Container classes="h-[100%] overflow-hidden overflow-y-auto">
                        <Outlet />
                    </Container>
                </div>
            </main>
        </main>
    )
}