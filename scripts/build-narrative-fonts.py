from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen
from fontTools import subset
import argparse, json, pathlib
parser=argparse.ArgumentParser(description="Build matching native WOFF and Three.js narrative outlines from official source TTF files.")
parser.add_argument("source_dir",type=pathlib.Path,help="Directory containing portfolio-manrope.ttf, portfolio-instrument-italic.ttf and portfolio-instrument-regular.ttf")
parser.add_argument("--output",type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[1]/"dist/assets/fonts")
args=parser.parse_args()
out=args.output
out.mkdir(parents=True,exist_ok=True)
chars=list(range(32,127))+[0x2013,0x2014,0x2018,0x2019,0x201c,0x201d,0x2026,0x2197,0x2198]
class OutlinePen(BasePen):
 def __init__(self, glyphset, scale):
  super().__init__(glyphset); self.ops=[]; self.scale=scale; self.start=None
 def xy(self,p): return [round(p[0]*self.scale,2),round(p[1]*self.scale,2)]
 def emit(self,c,*pts): self.ops.append(c); [self.ops.extend(map(str,self.xy(p))) for p in pts]
 def _moveTo(self,p): self.start=p; self.emit('m',p)
 def _lineTo(self,p): self.emit('l',p)
 def _qCurveToOne(self,a,b): self.emit('q',b,a)
 def _curveToOne(self,a,b,c): self.emit('b',c,a,b)
 def _closePath(self): self.emit('l',self.start)
 def _endPath(self): pass
allfonts={}
for key,path,weight in [('manrope500',args.source_dir/'portfolio-manrope.ttf',500),('manrope600',args.source_dir/'portfolio-manrope.ttf',600),('serifItalic',args.source_dir/'portfolio-instrument-italic.ttf',None),('serifRegular',args.source_dir/'portfolio-instrument-regular.ttf',None)]:
 f=TTFont(path)
 if weight: f=instantiateVariableFont(f,{'wght':weight},inplace=False)
 scale=1000/f['head'].unitsPerEm; glyphset=f.getGlyphSet(); cmap=f.getBestCmap(); glyphs={}
 for cp in chars:
  if cp not in cmap: continue
  name=cmap[cp]; pen=OutlinePen(glyphset,scale); glyphset[name].draw(pen)
  glyphs[chr(cp)]={'ha':round(f['hmtx'].metrics[name][0]*scale,2),'o':' '.join(pen.ops)}
 allfonts[key]={'glyphs':glyphs,'familyName':key,'resolution':1000,'ascender':f['hhea'].ascent*scale,'descender':f['hhea'].descent*scale,'boundingBox':{'yMin':f['head'].yMin*scale,'yMax':f['head'].yMax*scale},'underlineThickness':50}
(out/'narrative-outlines.json').write_text(json.dumps(allfonts,separators=(',',':')))
for name,path in [('manrope-variable.woff',args.source_dir/'portfolio-manrope.ttf'),('instrument-italic.woff',args.source_dir/'portfolio-instrument-italic.ttf'),('instrument-regular.woff',args.source_dir/'portfolio-instrument-regular.ttf')]:
 f=TTFont(path); options=subset.Options(); options.flavor='woff'; sub=subset.Subsetter(options=options); sub.populate(unicodes=chars); sub.subset(f); f.flavor='woff'; f.save(out/name)
print({p.name:p.stat().st_size for p in out.iterdir()})
