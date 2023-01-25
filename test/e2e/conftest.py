import pathlib
from _pytest._code import code
from _pytest._code.code import ReprTraceback

def ishidden(self) -> bool:
    return self._ishidden() or 'site-packages' in pathlib.Path(self.path).parts
code.TracebackEntry._ishidden = code.TracebackEntry.ishidden
code.TracebackEntry.ishidden = ishidden

def repr_traceback(self, excinfo: code.ExceptionInfo[BaseException]) -> "ReprTraceback":
    traceback = excinfo.traceback
    if True:  # self.tbfilter:  <- filtering was not done for nested exception, so force it
        traceback = traceback.filter()
    # make sure we don't get an empty traceback list
    if len(traceback) == 0:
        traceback.append(excinfo.traceback[-1])

    if isinstance(excinfo.value, RecursionError):
        traceback, extraline = self._truncate_recursive_traceback(traceback)
    else:
        extraline = None

    last = traceback[-1]
    entries = []
    if self.style == "value":
        reprentry = self.repr_traceback_entry(last, excinfo)
        entries.append(reprentry)
        return ReprTraceback(entries, None, style=self.style)

    for index, entry in enumerate(traceback):
        einfo = (last == entry) and excinfo or None
        reprentry = self.repr_traceback_entry(entry, einfo)
        entries.append(reprentry)
    return ReprTraceback(entries, extraline, style=self.style)
code.FormattedExcinfo.repr_traceback = repr_traceback

del code
