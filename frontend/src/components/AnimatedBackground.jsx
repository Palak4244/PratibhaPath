export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{background:"#050B18"}}>
      <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle,#1E293B 1px,transparent 1px)",backgroundSize:"32px 32px"}}/>
      <div className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full animate-float1" style={{background:"radial-gradient(circle,rgba(34,211,238,0.15) 0%,transparent 70%)",filter:"blur(60px)"}}/>
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full animate-float2" style={{background:"radial-gradient(circle,rgba(129,140,248,0.12) 0%,transparent 70%)",filter:"blur(60px)"}}/>
      <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full animate-float1" style={{background:"radial-gradient(circle,rgba(45,212,191,0.1) 0%,transparent 70%)",filter:"blur(60px)",animationDelay:"4s"}}/>
    </div>
  );
}
