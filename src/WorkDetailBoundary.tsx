import { Component, type ReactNode } from "react";

export class WorkDetailBoundary extends Component<{
  children: ReactNode;
}, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="work-detail-page section-pad work-not-found" aria-labelledby="work-load-error-title">
        <div className="container" role="alert">
          <div className="project-detail-head">
            <div>
              <p className="eyebrow">PROJECT UNAVAILABLE</p>
              <h1 id="work-load-error-title">项目暂时无法加载</h1>
            </div>
          </div>
          <p>请检查网络连接后重新加载页面，或先返回作品列表。</p>
          <div className="detail-footer-actions">
            <button
              className="detail-back"
              type="button"
              onClick={() => window.location.reload()}
              style={{ background: "transparent", fontFamily: "inherit", cursor: "pointer" }}
            >
              重新加载
            </button>
            <a className="detail-back secondary" href="#projects">返回作品列表</a>
          </div>
        </div>
      </section>
    );
  }
}
