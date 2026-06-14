from src.domain.rules.club_state_machine import (
    MEMBER_ACTIVE,
    MEMBER_APPROVED,
    MEMBER_PAYMENT_CLAIMED,
    MEMBER_PAYMENT_PENDING,
    MEMBER_PENDING,
    MEMBER_REJECTED,
    OCCUPIED_MEMBER_STATUSES,
    PRIVATE_ACCESS_STATUSES,
    transition,
)


def test_approval_does_not_occupy_seat() -> None:
    assert MEMBER_PENDING not in OCCUPIED_MEMBER_STATUSES
    assert MEMBER_APPROVED not in OCCUPIED_MEMBER_STATUSES


def test_access_and_payment_statuses_occupy_seat() -> None:
    assert MEMBER_PAYMENT_PENDING in OCCUPIED_MEMBER_STATUSES
    assert MEMBER_PAYMENT_CLAIMED in OCCUPIED_MEMBER_STATUSES
    assert MEMBER_ACTIVE in OCCUPIED_MEMBER_STATUSES


def test_payment_details_visible_only_after_access_flow_starts() -> None:
    assert MEMBER_APPROVED not in PRIVATE_ACCESS_STATUSES
    assert MEMBER_PAYMENT_PENDING in PRIVATE_ACCESS_STATUSES
    assert MEMBER_PAYMENT_CLAIMED in PRIVATE_ACCESS_STATUSES
    assert MEMBER_ACTIVE in PRIVATE_ACCESS_STATUSES


def test_family_member_transition_chain() -> None:
    assert transition("approve", MEMBER_PENDING) == MEMBER_APPROVED
    assert transition("issue_access", MEMBER_APPROVED) == MEMBER_PAYMENT_PENDING
    assert transition("mark_paid", MEMBER_PAYMENT_PENDING) == MEMBER_PAYMENT_CLAIMED
    assert transition("confirm_payment", MEMBER_PAYMENT_CLAIMED) == MEMBER_ACTIVE
    assert transition("reject", MEMBER_PENDING) == MEMBER_REJECTED
