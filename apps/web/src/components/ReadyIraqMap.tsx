import { useEffect, useRef } from 'react';
import {
  IRAQ_GOVERNORATES,
  type IraqGovId,
} from '@/data/iraq-governorates';
import { useTheme } from '@/stores/theme-context';
import { cn } from '@/lib/utils';

type Mode = 'coverage' | 'offices';

type Props = {
  mode: Mode;
  locale: 'en' | 'ar';
  hovered: IraqGovId | null;
  selected?: IraqGovId | null;
  activeIds?: Set<IraqGovId>;
  onHover: (id: IraqGovId | null) => void;
  onSelect?: (id: IraqGovId) => void;
  className?: string;
  ariaLabel?: string;
};

export function ReadyIraqMap({
  mode,
  locale,
  hovered,
  selected = null,
  activeIds,
  onHover,
  onSelect,
  className,
  ariaLabel,
}: Props) {
  const { theme } = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  const stateRef = useRef({ mode, hovered, selected, activeIds, locale, theme });

  onHoverRef.current = onHover;
  onSelectRef.current = onSelect;
  stateRef.current = { mode, hovered, selected, activeIds, locale, theme };

  function paint() {
    const svg = svgRef.current;
    if (!svg) return;
    const {
      mode: m,
      hovered: h,
      selected: s,
      activeIds: active,
      locale: loc,
      theme: th,
    } = stateRef.current;
    const dark = th === 'dark';

    for (const g of IRAQ_GOVERNORATES) {
      const path = svg.querySelector(`#features path#${g.iso}`) as SVGPathElement | null;
      if (!path) continue;

      const isHovered = h === g.id;
      const isSelected = s === g.id;
      const isActive = m === 'coverage' ? true : Boolean(active?.has(g.id));

      if (m === 'coverage') {
        if (isHovered) {
          path.style.fill = '#0070c0';
          path.style.stroke = dark ? '#9ad0ff' : '#005a9a';
          path.style.filter = 'drop-shadow(0 0 8px rgb(0 112 192 / 0.55))';
        } else if (dark) {
          path.style.fill = 'rgb(0 112 192 / 0.45)';
          path.style.stroke = 'rgb(0 112 192 / 0.95)';
          path.style.filter = 'none';
        } else {
          path.style.fill = 'rgb(0 112 192 / 0.22)';
          path.style.stroke = 'rgb(0 112 192 / 0.7)';
          path.style.filter = 'none';
        }
      } else if (isSelected) {
        path.style.fill = '#0070c0';
        path.style.stroke = dark ? '#9ad0ff' : '#005a9a';
        path.style.filter = 'drop-shadow(0 0 10px rgb(0 112 192 / 0.55))';
      } else if (isHovered && isActive) {
        path.style.fill = 'rgb(0 112 192 / 0.75)';
        path.style.stroke = dark ? '#7ec8ff' : '#0070c0';
        path.style.filter = 'drop-shadow(0 0 8px rgb(0 112 192 / 0.45))';
      } else if (isHovered) {
        path.style.fill = dark ? 'rgb(255 255 255 / 0.14)' : 'rgb(0 112 192 / 0.12)';
        path.style.stroke = dark ? 'rgb(255 255 255 / 0.35)' : 'rgb(0 112 192 / 0.35)';
        path.style.filter = 'none';
      } else if (isActive) {
        path.style.fill = dark ? 'rgb(0 112 192 / 0.4)' : 'rgb(0 112 192 / 0.28)';
        path.style.stroke = dark ? 'rgb(0 112 192 / 0.9)' : 'rgb(0 112 192 / 0.75)';
        path.style.filter = 'none';
      } else if (dark) {
        path.style.fill = 'rgb(255 255 255 / 0.06)';
        path.style.stroke = 'rgb(255 255 255 / 0.16)';
        path.style.filter = 'none';
      } else {
        path.style.fill = 'rgb(15 23 42 / 0.05)';
        path.style.stroke = 'rgb(15 23 42 / 0.18)';
        path.style.filter = 'none';
      }

      path.setAttribute('aria-label', loc === 'ar' ? g.nameAr : g.nameEn);
    }

    let markers = svg.querySelector('#eh-markers') as SVGGElement | null;
    if (m === 'offices' && active?.size) {
      if (!markers) {
        markers = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        markers.setAttribute('id', 'eh-markers');
        markers.style.pointerEvents = 'none';
        svg.appendChild(markers);
      }
      markers.innerHTML = '';
      for (const g of IRAQ_GOVERNORATES) {
        if (!active.has(g.id)) continue;
        const lit = s === g.id || h === g.id;
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('cx', String(g.cx));
        pulse.setAttribute('cy', String(g.cy));
        pulse.setAttribute('r', lit ? '16' : '12');
        pulse.setAttribute('fill', 'rgb(0 112 192 / 0.25)');
        pulse.setAttribute('class', 'iraq-pin-pulse');

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', String(g.cx));
        dot.setAttribute('cy', String(g.cy));
        dot.setAttribute('r', '5.5');
        dot.setAttribute('fill', '#0070c0');
        dot.setAttribute('stroke', dark ? '#fff' : '#f8fafc');
        dot.setAttribute('stroke-width', '2');

        markers.appendChild(pulse);
        markers.appendChild(dot);
      }
    } else if (markers) {
      markers.remove();
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch('/maps/iraq-simplemaps.svg');
      const text = await res.text();
      if (cancelled || !hostRef.current) return;

      hostRef.current.innerHTML = text;
      const svg = hostRef.current.querySelector('svg');
      if (!svg) return;
      svgRef.current = svg;

      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.display = 'block';
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxHeight = '520px';
      if (!svg.getAttribute('viewBox') && svg.getAttribute('viewbox')) {
        svg.setAttribute('viewBox', svg.getAttribute('viewbox')!);
      }

      svg.querySelector('#points')?.setAttribute('display', 'none');
      svg.querySelector('#label_points')?.setAttribute('display', 'none');

      const features = svg.querySelector('#features');
      features?.setAttribute('fill', 'none');
      features?.setAttribute('stroke', 'none');

      for (const g of IRAQ_GOVERNORATES) {
        const path = svg.querySelector(`#features path#${g.iso}`) as SVGPathElement | null;
        if (!path) continue;
        path.style.cursor = 'pointer';
        path.style.transition = 'fill 0.25s ease, stroke 0.25s ease, filter 0.25s ease';
        path.style.strokeWidth = '1.25';
        path.style.strokeLinejoin = 'round';

        path.addEventListener('mouseenter', () => onHoverRef.current(g.id));
        path.addEventListener('mouseleave', () => onHoverRef.current(null));
        path.addEventListener('click', () => onSelectRef.current?.(g.id));
      }

      paint();
    }

    void load();

    return () => {
      cancelled = true;
      if (hostRef.current) hostRef.current.innerHTML = '';
      svgRef.current = null;
    };
  }, []);

  useEffect(() => {
    paint();
  }, [hovered, selected, activeIds, mode, locale, theme]);

  return (
    <div
      ref={hostRef}
      className={cn('iraq-ready-map w-full [&_svg]:mx-auto', className)}
      role="img"
      aria-label={ariaLabel}
    />
  );
}
