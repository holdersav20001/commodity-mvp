from abc import ABC, abstractmethod

from app.schemas.case_study import CaseStudy, CaseStudySummary


class CaseStudyProvider(ABC):
    @abstractmethod
    def list_cases(self) -> list[CaseStudySummary]:
        raise NotImplementedError

    @abstractmethod
    def get_case(self, case_id: str) -> CaseStudy:
        raise NotImplementedError
